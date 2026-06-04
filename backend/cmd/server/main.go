package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"motorcycle-team/internal/config"
	"motorcycle-team/internal/middleware"
	"motorcycle-team/internal/routes"
)

func main() {
	config.LoadConfig()
	config.InitDB()

	r := gin.Default()

	r.Use(middleware.CORS())
	r.MaxMultipartMemory = config.AppConfig.MaxUploadSize

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	r.Static("/uploads", "./uploads")

	api := r.Group("/api")
	routes.RegisterAuthRoutes(api)
	routes.RegisterUserRoutes(api)
	routes.RegisterEventRoutes(api)
	routes.RegisterRegistrationRoutes(api)
	routes.RegisterCheckinRoutes(api)
	routes.RegisterGroupRoutes(api)
	routes.RegisterReviewRoutes(api)

	addr := config.AppConfig.ServerHost + ":" + config.AppConfig.ServerPort
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
