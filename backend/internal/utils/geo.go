package utils

import (
	"math"
)

func HaversineDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const earthRadius = 6371000.0

	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	deltaLat := (lat2 - lat1) * math.Pi / 180
	deltaLng := (lng2 - lng1) * math.Pi / 180

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLng/2)*math.Sin(deltaLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}

func IsWithinRadius(lat1, lng1, lat2, lng2 float64, radius int) bool {
	distance := HaversineDistance(lat1, lng1, lat2, lng2)
	return distance <= float64(radius)
}
