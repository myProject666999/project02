package handlers

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"motorcycle-team/internal/config"
	"motorcycle-team/internal/models"
	"motorcycle-team/internal/utils"
)

type CreateRegistrationRequest struct {
	EventID uint64 `json:"event_id" binding:"required"`
}

type ReviewRegistrationRequest struct {
	Status string `json:"status" binding:"required,oneof=approved rejected"`
	Note   string `json:"note"`
}

var licenseLevelOrder = map[string]int{
	"A1": 1,
	"A2": 2,
	"A3": 3,
	"B1": 4,
	"B2": 5,
	"C1": 6,
	"C2": 7,
	"C3": 8,
	"C4": 9,
	"D":  10,
	"E":  11,
	"F":  12,
	"M":  13,
	"N":  14,
	"P":  15,
}

func meetsLicenseRequirement(userLicense, requiredLicense string) bool {
	if requiredLicense == "" {
		return true
	}
	userLevel, userOk := licenseLevelOrder[userLicense]
	requiredLevel, requiredOk := licenseLevelOrder[requiredLicense]
	if !userOk || !requiredOk {
		return false
	}
	return userLevel >= requiredLevel
}

func CreateRegistration(c *gin.Context) {
	userID := c.GetUint64("userID")

	var req CreateRegistrationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	var event models.Event
	if err := config.DB.First(&event, req.EventID).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	if event.Status != "pending" {
		utils.BadRequest(c, "活动已开始或已结束，无法报名")
		return
	}

	var existingReg models.Registration
	if err := config.DB.Where("event_id = ? AND user_id = ?", req.EventID, userID).First(&existingReg).Error; err == nil {
		utils.BadRequest(c, "已报名此活动")
		return
	}

	var approvedCount int64
	config.DB.Model(&models.Registration{}).Where("event_id = ? AND status = ?", req.EventID, "approved").Count(&approvedCount)
	if approvedCount >= int64(event.MaxParticipants) {
		utils.BadRequest(c, "报名人数已满")
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	autoApprove := true
	status := "approved"
	reviewNote := ""

	if user.Displacement < event.MinDisplacement {
		autoApprove = false
		reviewNote = "排量不足，需要手动审核"
	}

	if event.RequireLicenseLevel != "" && !meetsLicenseRequirement(user.LicenseLevel, event.RequireLicenseLevel) {
		autoApprove = false
		if reviewNote != "" {
			reviewNote += "；"
		}
		reviewNote += "驾照等级不符合要求，需要手动审核"
	}

	if !autoApprove {
		status = "pending"
	}

	now := time.Now()
	reg := models.Registration{
		EventID:      req.EventID,
		UserID:       userID,
		Displacement: user.Displacement,
		LicenseLevel: user.LicenseLevel,
		Status:       status,
		ReviewNote:   reviewNote,
	}

	if status == "approved" {
		reg.ReviewedBy = &userID
		reg.ReviewedAt = &now
	}

	if err := config.DB.Create(&reg).Error; err != nil {
		utils.InternalServerError(c, "报名失败")
		return
	}

	message := "报名成功"
	if status == "pending" {
		message = "报名已提交，等待审核"
	}

	utils.SuccessWithMessage(c, message, reg)
}

func MyRegistrations(c *gin.Context) {
	userID := c.GetUint64("userID")

	var regs []models.Registration
	if err := config.DB.Preload("Event").Preload("Event.Creator").
		Where("user_id = ?", userID).Order("created_at DESC").Find(&regs).Error; err != nil {
		utils.InternalServerError(c, "查询失败")
		return
	}

	utils.Success(c, regs)
}

func EventRegistrations(c *gin.Context) {
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
		utils.Forbidden(c, "无权限查看报名列表")
		return
	}

	var regs []models.Registration
	if err := config.DB.Preload("User").
		Where("event_id = ?", eventID).Order("created_at DESC").Find(&regs).Error; err != nil {
		utils.InternalServerError(c, "查询失败")
		return
	}

	utils.Success(c, regs)
}

func ReviewRegistration(c *gin.Context) {
	userID := c.GetUint64("userID")
	regIDStr := c.Param("id")
	regID, err := strconv.ParseUint(regIDStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的报名ID")
		return
	}

	var reg models.Registration
	if err := config.DB.First(&reg, regID).Error; err != nil {
		utils.NotFound(c, "报名记录不存在")
		return
	}

	var event models.Event
	if err := config.DB.First(&event, reg.EventID).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	if event.CreatorID != userID {
		utils.Forbidden(c, "无权限审核")
		return
	}

	var req ReviewRegistrationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	now := time.Now()
	updates := map[string]interface{}{
		"status":      req.Status,
		"review_note": req.Note,
		"reviewed_by": userID,
		"reviewed_at": now,
	}

	if req.Status == "approved" {
		var approvedCount int64
		config.DB.Model(&models.Registration{}).
			Where("event_id = ? AND status = ? AND id != ?", reg.EventID, "approved", regID).
			Count(&approvedCount)
		if approvedCount >= int64(event.MaxParticipants) {
			utils.BadRequest(c, "报名人数已满")
			return
		}
	}

	if err := config.DB.Model(&reg).Updates(updates).Error; err != nil {
		utils.InternalServerError(c, "审核失败")
		return
	}

	config.DB.First(&reg, regID)
	utils.Success(c, reg)
}
