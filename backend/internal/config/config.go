package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	ServerHost     string
	ServerPort     string
	JWTSecret      string
	JWTExpireHours int
	UploadDir      string
	MaxUploadSize  int64
}

var AppConfig *Config

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	jwtExpireHours, _ := strconv.Atoi(getEnv("JWT_EXPIRE_HOURS", "24"))
	maxUploadSize, _ := strconv.ParseInt(getEnv("MAX_UPLOAD_SIZE", "10485760"), 10, 64)

	AppConfig = &Config{
		DBHost:         getEnv("DB_HOST", "127.0.0.1"),
		DBPort:         getEnv("DB_PORT", "3306"),
		DBUser:         getEnv("DB_USER", "root"),
		DBPassword:     getEnv("DB_PASSWORD", "123456"),
		DBName:         getEnv("DB_NAME", "motorcycle_team"),
		ServerHost:     getEnv("SERVER_HOST", "0.0.0.0"),
		ServerPort:     getEnv("SERVER_PORT", "8080"),
		JWTSecret:      getEnv("JWT_SECRET", "motorcycle-team-secret-key-2024"),
		JWTExpireHours: jwtExpireHours,
		UploadDir:      getEnv("UPLOAD_DIR", "./uploads"),
		MaxUploadSize:  maxUploadSize,
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
