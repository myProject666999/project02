package models

import (
	"time"
)

type User struct {
	ID                uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Username          string    `gorm:"size:50;unique;not null" json:"username"`
	Phone             string    `gorm:"size:20;unique;not null" json:"phone"`
	PasswordHash      string    `gorm:"size:255;not null" json:"-"`
	Nickname          string    `gorm:"size:50" json:"nickname"`
	Avatar            string    `gorm:"size:255" json:"avatar"`
	MotorcycleBrand   string    `gorm:"size:100" json:"motorcycle_brand"`
	MotorcycleModel   string    `gorm:"size:100" json:"motorcycle_model"`
	Displacement      int       `json:"displacement"`
	LicenseLevel      string    `gorm:"size:20" json:"license_level"`
	LicenseNumber     string    `gorm:"size:50" json:"license_number"`
	ProficiencyLevel  string    `gorm:"size:10;default:'C'" json:"proficiency_level"`
	TotalRides        int       `gorm:"default:0" json:"total_rides"`
	TotalDistance     float64   `gorm:"type:decimal(10,2);default:0" json:"total_distance"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
