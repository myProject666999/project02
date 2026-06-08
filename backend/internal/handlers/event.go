package handlers

import (
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"motorcycle-team/internal/config"
	"motorcycle-team/internal/models"
	"motorcycle-team/internal/utils"
	"motorcycle-team/pkg/gpx"
)

type CreateEventRequest struct {
	Title              string       `json:"title" binding:"required,max=200"`
	Description        string       `json:"description"`
	StartPoint         string       `json:"start_point" binding:"required"`
	StartLat           float64      `json:"start_lat"`
	StartLng           float64      `json:"start_lng"`
	EndPoint           string       `json:"end_point" binding:"required"`
	EndLat             float64      `json:"end_lat"`
	EndLng             float64      `json:"end_lng"`
	MeetTime           utils.DateTime `json:"meet_time" binding:"required"`
	RouteDescription   string       `json:"route_description"`
	MinDisplacement    int          `json:"min_displacement"`
	RequireLicenseLevel string      `json:"require_license_level"`
	MaxParticipants    int          `json:"max_participants"`
	CheckinRadius      int          `json:"checkin_radius"`
}

type UpdateEventRequest struct {
	Title              string       `json:"title"`
	Description        string       `json:"description"`
	StartPoint         string       `json:"start_point"`
	StartLat           float64      `json:"start_lat"`
	StartLng           float64      `json:"start_lng"`
	EndPoint           string       `json:"end_point"`
	EndLat             float64      `json:"end_lat"`
	EndLng             float64      `json:"end_lng"`
	MeetTime           utils.DateTime `json:"meet_time"`
	RouteDescription   string       `json:"route_description"`
	MinDisplacement    int          `json:"min_displacement"`
	RequireLicenseLevel string      `json:"require_license_level"`
	MaxParticipants    int          `json:"max_participants"`
	CheckinRadius      int          `json:"checkin_radius"`
	Status             string       `json:"status"`
}

func CreateEvent(c *gin.Context) {
	userID := c.GetUint64("userID")

	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	event := models.Event{
		CreatorID:          userID,
		Title:              req.Title,
		Description:        req.Description,
		StartPoint:         req.StartPoint,
		StartLat:           req.StartLat,
		StartLng:           req.StartLng,
		EndPoint:           req.EndPoint,
		EndLat:             req.EndLat,
		EndLng:             req.EndLng,
		MeetTime:           req.MeetTime.Time,
		RouteDescription:   req.RouteDescription,
		MinDisplacement:    req.MinDisplacement,
		RequireLicenseLevel: req.RequireLicenseLevel,
		MaxParticipants:    req.MaxParticipants,
		CheckinRadius:      req.CheckinRadius,
		Status:             "pending",
	}

	if event.MaxParticipants == 0 {
		event.MaxParticipants = 20
	}
	if event.CheckinRadius == 0 {
		event.CheckinRadius = 200
	}

	if err := config.DB.Create(&event).Error; err != nil {
		utils.InternalServerError(c, "创建活动失败")
		return
	}

	utils.Success(c, event)
}

func GetEvent(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的活动ID")
		return
	}

	var event models.Event
	if err := config.DB.Preload("Creator").First(&event, id).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	var approvedCount int64
	config.DB.Model(&models.Registration{}).Where("event_id = ? AND status = ?", id, "approved").Count(&approvedCount)

	utils.Success(c, gin.H{
		"event":          event,
		"approved_count": approvedCount,
	})
}

func ListEvents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	query := config.DB.Model(&models.Event{}).Preload("Creator")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var events []models.Event
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("meet_time DESC").Find(&events).Error; err != nil {
		utils.InternalServerError(c, "查询失败")
		return
	}

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"events":    events,
	})
}

func UpdateEvent(c *gin.Context) {
	userID := c.GetUint64("userID")
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的活动ID")
		return
	}

	var event models.Event
	if err := config.DB.First(&event, id).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	if event.CreatorID != userID {
		utils.Forbidden(c, "无权限修改此活动")
		return
	}

	var req UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	updates := make(map[string]interface{})
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.StartPoint != "" {
		updates["start_point"] = req.StartPoint
	}
	if req.StartLat != 0 {
		updates["start_lat"] = req.StartLat
	}
	if req.StartLng != 0 {
		updates["start_lng"] = req.StartLng
	}
	if req.EndPoint != "" {
		updates["end_point"] = req.EndPoint
	}
	if req.EndLat != 0 {
		updates["end_lat"] = req.EndLat
	}
	if req.EndLng != 0 {
		updates["end_lng"] = req.EndLng
	}
	if !req.MeetTime.Time.IsZero() {
		updates["meet_time"] = req.MeetTime.Time
	}
	if req.RouteDescription != "" {
		updates["route_description"] = req.RouteDescription
	}
	if req.MinDisplacement > 0 {
		updates["min_displacement"] = req.MinDisplacement
	}
	if req.RequireLicenseLevel != "" {
		updates["require_license_level"] = req.RequireLicenseLevel
	}
	if req.MaxParticipants > 0 {
		updates["max_participants"] = req.MaxParticipants
	}
	if req.CheckinRadius > 0 {
		updates["checkin_radius"] = req.CheckinRadius
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}

	if err := config.DB.Model(&event).Updates(updates).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	config.DB.First(&event, id)
	utils.Success(c, event)
}

func DeleteEvent(c *gin.Context) {
	userID := c.GetUint64("userID")
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的活动ID")
		return
	}

	var event models.Event
	if err := config.DB.First(&event, id).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	if event.CreatorID != userID {
		utils.Forbidden(c, "无权限删除此活动")
		return
	}

	if err := config.DB.Delete(&event).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}

func UploadGPX(c *gin.Context) {
	userID := c.GetUint64("userID")
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的活动ID")
		return
	}

	var event models.Event
	if err := config.DB.First(&event, id).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	if event.CreatorID != userID {
		utils.Forbidden(c, "无权限上传路线")
		return
	}

	file, err := c.FormFile("gpx")
	if err != nil {
		utils.BadRequest(c, "请选择GPX文件")
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

	event.RouteGPXPath = "/" + filePath
	if err := config.DB.Save(&event).Error; err != nil {
		utils.InternalServerError(c, "保存路线失败")
		return
	}

	utils.Success(c, gin.H{
		"gpx_path": event.RouteGPXPath,
		"stats":    stats,
	})
}
