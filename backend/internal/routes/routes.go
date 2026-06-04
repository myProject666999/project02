package routes

import (
	"github.com/gin-gonic/gin"
	"motorcycle-team/internal/handlers"
	"motorcycle-team/internal/middleware"
)

func RegisterAuthRoutes(r *gin.RouterGroup) {
	auth := r.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}
}

func RegisterUserRoutes(r *gin.RouterGroup) {
	user := r.Group("/users")
	user.Use(middleware.AuthRequired())
	{
		user.GET("/profile", handlers.GetProfile)
		user.PUT("/profile", handlers.UpdateProfile)
		user.GET("/:id", handlers.GetUser)
	}
}

func RegisterEventRoutes(r *gin.RouterGroup) {
	event := r.Group("/events")
	{
		event.GET("", handlers.ListEvents)
		event.GET("/:id", handlers.GetEvent)
	}
	eventAuth := r.Group("/events")
	eventAuth.Use(middleware.AuthRequired())
	{
		eventAuth.POST("", handlers.CreateEvent)
		eventAuth.PUT("/:id", handlers.UpdateEvent)
		eventAuth.DELETE("/:id", handlers.DeleteEvent)
		eventAuth.POST("/:id/upload-gpx", handlers.UploadGPX)
	}
}

func RegisterRegistrationRoutes(r *gin.RouterGroup) {
	reg := r.Group("/registrations")
	reg.Use(middleware.AuthRequired())
	{
		reg.POST("", handlers.CreateRegistration)
		reg.GET("/my", handlers.MyRegistrations)
		reg.GET("/event/:eventId", handlers.EventRegistrations)
		reg.PUT("/:id/review", handlers.ReviewRegistration)
	}
}

func RegisterCheckinRoutes(r *gin.RouterGroup) {
	checkin := r.Group("/checkins")
	checkin.Use(middleware.AuthRequired())
	{
		checkin.POST("", handlers.CreateCheckin)
		checkin.GET("/event/:eventId", handlers.EventCheckins)
		checkin.GET("/event/:eventId/my", handlers.MyCheckin)
	}
}

func RegisterGroupRoutes(r *gin.RouterGroup) {
	group := r.Group("/groups")
	group.Use(middleware.AuthRequired())
	{
		group.POST("/event/:eventId/generate", handlers.GenerateGroups)
		group.GET("/event/:eventId", handlers.GetEventGroups)
		group.POST("/:groupId/members", handlers.AddGroupMember)
		group.DELETE("/:groupId/members/:userId", handlers.RemoveGroupMember)
	}
}

func RegisterReviewRoutes(r *gin.RouterGroup) {
	review := r.Group("/reviews")
	review.Use(middleware.AuthRequired())
	{
		review.POST("", handlers.CreateReview)
		review.GET("/event/:eventId", handlers.EventReviews)
		review.GET("/my", handlers.MyReviews)
		review.GET("/:id", handlers.GetReview)
		review.POST("/:id/media", handlers.UploadMedia)
		review.POST("/:id/track", handlers.UploadTrack)
	}
}
