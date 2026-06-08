package handlers

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"motorcycle-team/internal/config"
	"motorcycle-team/internal/models"
	"motorcycle-team/internal/utils"
)

type CreateCheckinRequest struct {
	EventID uint64  `json:"event_id" binding:"required"`
	Lat     float64 `json:"lat" binding:"required"`
	Lng     float64 `json:"lng" binding:"required"`
}

func CreateCheckin(c *gin.Context) {
	userID := c.GetUint64("userID")

	var req CreateCheckinRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	var event models.Event
	if err := config.DB.First(&event, req.EventID).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	if event.Status == "cancelled" {
		utils.BadRequest(c, "活动已取消")
		return
	}

	var reg models.Registration
	if err := config.DB.Where("event_id = ? AND user_id = ? AND status = ?", req.EventID, userID, "approved").First(&reg).Error; err != nil {
		utils.Forbidden(c, "您未通过此活动的报名审核")
		return
	}

	var existingCheckin models.Checkin
	if err := config.DB.Where("event_id = ? AND user_id = ?", req.EventID, userID).First(&existingCheckin).Error; err == nil {
		utils.BadRequest(c, "已完成签到")
		return
	}

	distance := utils.HaversineDistance(event.StartLat, event.StartLng, req.Lat, req.Lng)
	isValid := distance <= float64(event.CheckinRadius)

	checkin := models.Checkin{
		EventID:           req.EventID,
		UserID:            userID,
		Lat:               req.Lat,
		Lng:               req.Lng,
		DistanceFromStart: distance,
		IsValid:           isValid,
		CheckinTime:       time.Now(),
	}

	if err := config.DB.Create(&checkin).Error; err != nil {
		utils.InternalServerError(c, "签到失败")
		return
	}

	if !isValid {
		utils.SuccessWithMessage(c, "签到位置不在集合点范围内，请确认位置后重试", checkin)
		return
	}

	utils.SuccessWithMessage(c, "签到成功", checkin)
}

func EventCheckins(c *gin.Context) {
	userID := c.GetUint64("userID")
	eventIDStr := c.Param("eventId")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的活动ID")
		return
	}

	var event models.Event
	if err := config.DB.First(&event, eventID).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	if event.CreatorID != userID {
		utils.Forbidden(c, "无权限查看签到列表")
		return
	}

	checkins := make([]models.Checkin, 0)
	if err := config.DB.Preload("User").
		Where("event_id = ?", eventID).Order("checkin_time DESC").Find(&checkins).Error; err != nil {
		utils.InternalServerError(c, "查询失败")
		return
	}

	var total int64
	var validCount int64
	config.DB.Model(&models.Checkin{}).Where("event_id = ?", eventID).Count(&total)
	config.DB.Model(&models.Checkin{}).Where("event_id = ? AND is_valid = ?", eventID, true).Count(&validCount)

	utils.Success(c, gin.H{
		"total":       total,
		"valid_count": validCount,
		"checkins":    checkins,
	})
}

func MyCheckin(c *gin.Context) {
	userID := c.GetUint64("userID")
	eventIDStr := c.Param("eventId")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的活动ID")
		return
	}

	var checkin models.Checkin
	if err := config.DB.Where("event_id = ? AND user_id = ?", eventID, userID).First(&checkin).Error; err != nil {
		utils.NotFound(c, "未签到")
		return
	}

	utils.Success(c, checkin)
}
