package gpx

import (
	"encoding/xml"
	"io"
	"math"
	"os"
	"time"
)

type GPX struct {
	XMLName xml.Name `xml:"gpx"`
	Version string   `xml:"version,attr"`
	Creator string   `xml:"creator,attr"`
	Tracks  []Track  `xml:"trk"`
}

type Track struct {
	Name      string    `xml:"name"`
	Segments  []Segment `xml:"trkseg"`
}

type Segment struct {
	Points []Point `xml:"trkpt"`
}

type Point struct {
	Lat       float64   `xml:"lat,attr"`
	Lon       float64   `xml:"lon,attr"`
	Elevation float64   `xml:"ele"`
	Time      time.Time `xml:"time"`
}

type TrackStats struct {
	TotalDistance float64
	MaxSpeed      float64
	AvgSpeed      float64
	TotalTime     time.Duration
	Points        []Point
}

func ParseFile(filePath string) (*GPX, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	return Parse(file)
}

func Parse(r io.Reader) (*GPX, error) {
	var gpx GPX
	decoder := xml.NewDecoder(r)
	err := decoder.Decode(&gpx)
	if err != nil {
		return nil, err
	}
	return &gpx, nil
}

func CalculateStats(gpx *GPX) TrackStats {
	var stats TrackStats
	var totalDistance float64
	var maxSpeed float64
	var totalSpeed float64
	var pointCount int
	var startTime, endTime time.Time

	for _, track := range gpx.Tracks {
		for _, segment := range track.Segments {
			for i, point := range segment.Points {
				stats.Points = append(stats.Points, point)

				if i > 0 {
					prevPoint := segment.Points[i-1]
					distance := haversineDistance(prevPoint.Lat, prevPoint.Lon, point.Lat, point.Lon)
					totalDistance += distance

					if !point.Time.IsZero() && !prevPoint.Time.IsZero() {
						timeDiff := point.Time.Sub(prevPoint.Time).Hours()
						if timeDiff > 0 {
							speed := distance / 1000 / timeDiff
							if speed > maxSpeed {
								maxSpeed = speed
							}
							totalSpeed += speed
							pointCount++
						}
					}
				}

				if startTime.IsZero() && !point.Time.IsZero() {
					startTime = point.Time
				}
				if !point.Time.IsZero() {
					endTime = point.Time
				}
			}
		}
	}

	stats.TotalDistance = totalDistance / 1000
	stats.MaxSpeed = maxSpeed
	if pointCount > 0 {
		stats.AvgSpeed = totalSpeed / float64(pointCount)
	}
	if !startTime.IsZero() && !endTime.IsZero() {
		stats.TotalTime = endTime.Sub(startTime)
	}

	return stats
}

func haversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadius = 6371000.0

	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	deltaLat := (lat2 - lat1) * math.Pi / 180
	deltaLon := (lon2 - lon1) * math.Pi / 180

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLon/2)*math.Sin(deltaLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}
