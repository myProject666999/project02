package handlers

import (
	"encoding/json"
	"io"
	"path/filepath"
	"strconv"
	"time"

	"motorcycle-team/internal/config"
	"motorcycle-team/internal/models"
	"motorcycle-team/internal/utils"
	"motorcycle-team/pkg/gpx"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateReviewRequest struct {
	EventID       uint64  `json:"event_id" binding:"required"`
	TotalDistance float64 `json:"total_distance"`
	MaxSpeed      float64 `json:"max_speed"`
	AvgSpeed      float64 `json:"avg_speed"`
	RideDuration  int     `json:"ride_duration"`
	Content       string  `json:"content"`
}

type TrackPointUpload struct {
	Lat       float64  `json:"lat" binding:"required"`
	Lng       float64  `json:"lng" binding:"required"`
	Elevation *float64 `json:"elevation"`
	Speed     *float64 `json:"speed"`
	Time      string   `json:"time" binding:"required"`
}

func CreateReview(c *gin.Context) {
	userID := c.GetUint64("userID")

	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	var event models.Event
	if err := config.DB.First(&event, req.EventID).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	var reg models.Registration
	if err := config.DB.Where("event_id = ? AND user_id = ? AND status = ?", req.EventID, userID, "approved").First(&reg).Error; err != nil {
		utils.Forbidden(c, "您未参加此活动")
		return
	}

	var existingReview models.Review
	if err := config.DB.Where("event_id = ? AND user_id = ?", req.EventID, userID).First(&existingReview).Error; err == nil {
		utils.BadRequest(c, "已提交过回顾")
		return
	}

	review := models.Review{
		EventID:       req.EventID,
		UserID:        userID,
		TotalDistance: req.TotalDistance,
		MaxSpeed:      req.MaxSpeed,
		AvgSpeed:      req.AvgSpeed,
		RideDuration:  req.RideDuration,
		Content:       req.Content,
	}

	if err := config.DB.Create(&review).Error; err != nil {
		utils.InternalServerError(c, "创建回顾失败")
		return
	}

	var user models.User
	config.DB.First(&user, userID)
	user.TotalRides++
	user.TotalDistance += req.TotalDistance
	if user.TotalRides >= 20 && user.TotalDistance >= 2000 {
		user.ProficiencyLevel = "A"
	} else if user.TotalRides >= 10 && user.TotalDistance >= 500 {
		user.ProficiencyLevel = "B"
	}
	config.DB.Save(&user)

	utils.Success(c, review)
}

func GetReview(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的回顾ID")
		return
	}

	var review models.Review
	if err := config.DB.Preload("User").First(&review, id).Error; err != nil {
		utils.NotFound(c, "回顾不存在")
		return
	}

	media := make([]models.Media, 0)
	config.DB.Where("review_id = ?", id).Find(&media)

	trackPoints := make([]models.TrackPoint, 0)
	config.DB.Where("review_id = ?", id).Order("recorded_at ASC").Find(&trackPoints)

	utils.Success(c, gin.H{
		"review":       review,
		"media":        media,
		"track_points": trackPoints,
	})
}

func MyReviews(c *gin.Context) {
	userID := c.GetUint64("userID")

	reviews := make([]models.Review, 0)
	if err := config.DB.Preload("User").
		Where("user_id = ?", userID).Order("created_at DESC").Find(&reviews).Error; err != nil {
		utils.InternalServerError(c, "查询失败")
		return
	}

	utils.Success(c, reviews)
}

func EventReviews(c *gin.Context) {
	eventIDStr := c.Param("eventId")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的活动ID")
		return
	}

	reviews := make([]models.Review, 0)
	if err := config.DB.Preload("User").
		Where("event_id = ?", eventID).Order("created_at DESC").Find(&reviews).Error; err != nil {
		utils.InternalServerError(c, "查询失败")
		return
	}

	var totalDistance float64
	var maxSpeed float64
	for _, r := range reviews {
		totalDistance += r.TotalDistance
		if r.MaxSpeed > maxSpeed {
			maxSpeed = r.MaxSpeed
		}
	}

	utils.Success(c, gin.H{
		"total_reviews":  len(reviews),
		"total_distance": totalDistance,
		"max_speed":      maxSpeed,
		"reviews":        reviews,
	})
}

func UploadMedia(c *gin.Context) {
	userID := c.GetUint64("userID")
	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的回顾ID")
		return
	}

	var review models.Review
	if err := config.DB.First(&review, reviewID).Error; err != nil {
		utils.NotFound(c, "回顾不存在")
		return
	}

	if review.UserID != userID {
		utils.Forbidden(c, "无权限上传")
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		utils.BadRequest(c, "请选择文件")
		return
	}

	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".mp4" && ext != ".mov" {
		utils.BadRequest(c, "只支持图片和视频文件")
		return
	}

	mediaType := "image"
	uploadDir := "images"
	if ext == ".mp4" || ext == ".mov" {
		mediaType = "video"
		uploadDir = "videos"
	}

	filename := uuid.New().String() + ext
	filePath := filepath.Join("uploads", uploadDir, filename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		utils.InternalServerError(c, "文件上传失败")
		return
	}

	latStr := c.PostForm("lat")
	lngStr := c.PostForm("lng")
	capturedAtStr := c.PostForm("captured_at")

	var lat *float64
	var lng *float64
	var capturedAt *time.Time

	if latStr != "" {
		if v, err := strconv.ParseFloat(latStr, 64); err == nil {
			lat = &v
		}
	}
	if lngStr != "" {
		if v, err := strconv.ParseFloat(lngStr, 64); err == nil {
			lng = &v
		}
	}
	if capturedAtStr != "" {
		var dt utils.DateTime
		if err := json.Unmarshal([]byte(`"`+capturedAtStr+`"`), &dt); err == nil {
			capturedAt = &dt.Time
		}
	}

	media := models.Media{
		ReviewID:   reviewID,
		EventID:    review.EventID,
		UserID:     userID,
		MediaType:  mediaType,
		FilePath:   "/" + filePath,
		FileSize:   file.Size,
		Lat:        lat,
		Lng:        lng,
		CapturedAt: capturedAt,
	}

	if err := config.DB.Create(&media).Error; err != nil {
		utils.InternalServerError(c, "保存媒体信息失败")
		return
	}

	utils.Success(c, media)
}

func UploadTrack(c *gin.Context) {
	userID := c.GetUint64("userID")
	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的回顾ID")
		return
	}

	var review models.Review
	if err := config.DB.First(&review, reviewID).Error; err != nil {
		utils.NotFound(c, "回顾不存在")
		return
	}

	if review.UserID != userID {
		utils.Forbidden(c, "无权限上传")
		return
	}

	file, err := c.FormFile("track")
	if err != nil {
		body, _ := io.ReadAll(c.Request.Body)
		var points []TrackPointUpload
		if json.Unmarshal(body, &points) == nil && len(points) > 0 {
			saveTrackPoints(reviewID, review.EventID, userID, points)
			utils.Success(c, nil)
			return
		}
		utils.BadRequest(c, "请选择GPX文件或上传轨迹点数据")
		return
	}

	ext := filepath.Ext(file.Filename)
	if ext != ".gpx" {
		utils.BadRequest(c, "只支持GPX文件")
		return
	}

	filename := uuid.New().String() + ".gpx"
	filePath := filepath.Join("uploads", "gpx", filename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		utils.InternalServerError(c, "文件上传失败")
		return
	}

	gpxData, err := gpx.ParseFile(filePath)
	if err != nil {
		utils.InternalServerError(c, "GPX文件解析失败")
		return
	}

	stats := gpx.CalculateStats(gpxData)

	var trackPoints []models.TrackPoint
	for _, track := range gpxData.Tracks {
		for _, segment := range track.Segments {
			for _, point := range segment.Points {
				tp := models.TrackPoint{
					ReviewID:   reviewID,
					UserID:     userID,
					EventID:    review.EventID,
					Lat:        point.Lat,
					Lng:        point.Lon,
					RecordedAt: point.Time,
				}
				if point.Elevation != 0 {
					tp.Elevation = &point.Elevation
				}
				trackPoints = append(trackPoints, tp)
			}
		}
	}

	if len(trackPoints) > 0 {
		if err := config.DB.Create(&trackPoints).Error; err != nil {
			utils.InternalServerError(c, "保存轨迹点失败")
			return
		}
	}

	updates := map[string]interface{}{
		"total_distance": stats.TotalDistance,
		"max_speed":      stats.MaxSpeed,
		"avg_speed":      stats.AvgSpeed,
		"ride_duration":  int(stats.TotalTime.Minutes()),
	}
	config.DB.Model(&review).Updates(updates)

	utils.Success(c, gin.H{
		"stats":        stats,
		"points_count": len(trackPoints),
	})
}

func saveTrackPoints(reviewID, eventID, userID uint64, points []TrackPointUpload) {
	var trackPoints []models.TrackPoint
	for _, p := range points {
		var dt utils.DateTime
		if err := json.Unmarshal([]byte(`"`+p.Time+`"`), &dt); err != nil {
			continue
		}
		tp := models.TrackPoint{
			ReviewID:   reviewID,
			UserID:     userID,
			EventID:    eventID,
			Lat:        p.Lat,
			Lng:        p.Lng,
			Elevation:  p.Elevation,
			Speed:      p.Speed,
			RecordedAt: dt.Time,
		}
		trackPoints = append(trackPoints, tp)
	}

	if len(trackPoints) > 0 {
		config.DB.Create(&trackPoints)
	}
}
