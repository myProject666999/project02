package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"motorcycle-team/internal/config"
	"motorcycle-team/internal/models"
	"motorcycle-team/internal/utils"
)

type RegisterRequest struct {
	Username          string `json:"username" binding:"required,min=3,max=50"`
	Phone             string `json:"phone" binding:"required,len=11"`
	Password          string `json:"password" binding:"required,min=6"`
	Nickname          string `json:"nickname"`
	MotorcycleBrand   string `json:"motorcycle_brand"`
	MotorcycleModel   string `json:"motorcycle_model"`
	Displacement      int    `json:"displacement"`
	LicenseLevel      string `json:"license_level"`
	LicenseNumber     string `json:"license_number"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	var existingUser models.User
	if err := config.DB.Where("username = ? OR phone = ?", req.Username, req.Phone).First(&existingUser).Error; err == nil {
		utils.BadRequest(c, "用户名或手机号已存在")
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}

	user := models.User{
		Username:        req.Username,
		Phone:           req.Phone,
		PasswordHash:    hashedPassword,
		Nickname:        req.Nickname,
		MotorcycleBrand: req.MotorcycleBrand,
		MotorcycleModel: req.MotorcycleModel,
		Displacement:    req.Displacement,
		LicenseLevel:    req.LicenseLevel,
		LicenseNumber:   req.LicenseNumber,
		ProficiencyLevel: "C",
	}

	if err := config.DB.Create(&user).Error; err != nil {
		utils.InternalServerError(c, "注册失败")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username)
	if err != nil {
		utils.InternalServerError(c, "生成token失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user":  user,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	var user models.User
	if err := config.DB.Where("username = ? OR phone = ?", req.Username, req.Username).First(&user).Error; err != nil {
		utils.Unauthorized(c, "用户名或密码错误")
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		utils.Unauthorized(c, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username)
	if err != nil {
		utils.InternalServerError(c, "生成token失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user":  user,
	})
}
