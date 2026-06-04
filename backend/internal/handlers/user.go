package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"motorcycle-team/internal/config"
	"motorcycle-team/internal/models"
	"motorcycle-team/internal/utils"
)

type UpdateProfileRequest struct {
	Nickname          string `json:"nickname"`
	Avatar            string `json:"avatar"`
	MotorcycleBrand   string `json:"motorcycle_brand"`
	MotorcycleModel   string `json:"motorcycle_model"`
	Displacement      int    `json:"displacement"`
	LicenseLevel      string `json:"license_level"`
	LicenseNumber     string `json:"license_number"`
}

func GetProfile(c *gin.Context) {
	userID := c.GetUint64("userID")

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}

func UpdateProfile(c *gin.Context) {
	userID := c.GetUint64("userID")

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	updates := make(map[string]interface{})
	if req.Nickname != "" {
		updates["nickname"] = req.Nickname
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}
	if req.MotorcycleBrand != "" {
		updates["motorcycle_brand"] = req.MotorcycleBrand
	}
	if req.MotorcycleModel != "" {
		updates["motorcycle_model"] = req.MotorcycleModel
	}
	if req.Displacement > 0 {
		updates["displacement"] = req.Displacement
	}
	if req.LicenseLevel != "" {
		updates["license_level"] = req.LicenseLevel
	}
	if req.LicenseNumber != "" {
		updates["license_number"] = req.LicenseNumber
	}

	if err := config.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	var updatedUser models.User
	config.DB.First(&updatedUser, userID)
	utils.Success(c, updatedUser)
}

func GetUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的用户ID")
		return
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}
