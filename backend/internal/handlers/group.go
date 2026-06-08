package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"motorcycle-team/internal/config"
	"motorcycle-team/internal/models"
	"motorcycle-team/internal/utils"
)

type GroupResult struct {
	GroupID   uint64          `json:"group_id"`
	GroupName string          `json:"group_name"`
	Level     string          `json:"level"`
	Members   []models.User   `json:"members"`
	Leader    *models.User    `json:"leader,omitempty"`
}

func GenerateGroups(c *gin.Context) {
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
		utils.Forbidden(c, "无权限生成分组")
		return
	}

	var existingGroups []models.Group
	config.DB.Where("event_id = ?", eventID).Find(&existingGroups)
	if len(existingGroups) > 0 {
		utils.BadRequest(c, "分组已存在，请先删除原有分组")
		return
	}

	var regs []models.Registration
	if err := config.DB.Preload("User").
		Where("event_id = ? AND status = ?", eventID, "approved").
		Find(&regs).Error; err != nil {
		utils.InternalServerError(c, "查询报名列表失败")
		return
	}

	if len(regs) == 0 {
		utils.BadRequest(c, "没有通过审核的报名者")
		return
	}

	groupA := models.Group{
		EventID:    eventID,
		GroupName:  "A组 - 快车组",
		GroupLevel: "A",
	}
	groupB := models.Group{
		EventID:    eventID,
		GroupName:  "B组 - 稳速组",
		GroupLevel: "B",
	}
	groupC := models.Group{
		EventID:    eventID,
		GroupName:  "C组 - 新手组",
		GroupLevel: "C",
	}

	config.DB.Create(&groupA)
	config.DB.Create(&groupB)
	config.DB.Create(&groupC)

	var membersA, membersB, membersC []models.GroupMember
	var leaderA, leaderB, leaderC *models.User

	for _, reg := range regs {
		if reg.User == nil {
			continue
		}

		var groupID uint64
		member := models.GroupMember{
			UserID:  reg.UserID,
			EventID: eventID,
		}

		switch reg.User.ProficiencyLevel {
		case "A":
			groupID = groupA.ID
			member.GroupID = groupA.ID
			if leaderA == nil || reg.User.Displacement > leaderA.Displacement {
				leaderA = reg.User
			}
		case "B":
			groupID = groupB.ID
			member.GroupID = groupB.ID
			if leaderB == nil || reg.User.Displacement > leaderB.Displacement {
				leaderB = reg.User
			}
		default:
			groupID = groupC.ID
			member.GroupID = groupC.ID
			if leaderC == nil || reg.User.Displacement > leaderC.Displacement {
				leaderC = reg.User
			}
		}

		if groupID == groupA.ID {
			membersA = append(membersA, member)
		} else if groupID == groupB.ID {
			membersB = append(membersB, member)
		} else {
			membersC = append(membersC, member)
		}
	}

	if len(membersA) > 0 {
		config.DB.Create(&membersA)
		if leaderA != nil {
			groupA.LeaderID = &leaderA.ID
			config.DB.Save(&groupA)
		}
	} else {
		config.DB.Delete(&groupA)
	}

	if len(membersB) > 0 {
		config.DB.Create(&membersB)
		if leaderB != nil {
			groupB.LeaderID = &leaderB.ID
			config.DB.Save(&groupB)
		}
	} else {
		config.DB.Delete(&groupB)
	}

	if len(membersC) > 0 {
		config.DB.Create(&membersC)
		if leaderC != nil {
			groupC.LeaderID = &leaderC.ID
			config.DB.Save(&groupC)
		}
	} else {
		config.DB.Delete(&groupC)
	}

	utils.SuccessWithMessage(c, "分组生成成功", nil)
}

func GetEventGroups(c *gin.Context) {
	eventIDStr := c.Param("eventId")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的活动ID")
		return
	}

	var groups []models.Group
	if err := config.DB.Preload("Leader").Where("event_id = ?", eventID).Find(&groups).Error; err != nil {
		utils.InternalServerError(c, "查询分组失败")
		return
	}

	results := make([]GroupResult, 0)
	for _, group := range groups {
		var members []models.GroupMember
		config.DB.Preload("User").Where("group_id = ?", group.ID).Find(&members)

		memberUsers := make([]models.User, 0)
		for _, m := range members {
			if m.User != nil {
				memberUsers = append(memberUsers, *m.User)
			}
		}

		result := GroupResult{
			GroupID:   group.ID,
			GroupName: group.GroupName,
			Level:     group.GroupLevel,
			Members:   memberUsers,
			Leader:    group.Leader,
		}
		results = append(results, result)
	}

	utils.Success(c, results)
}

func AddGroupMember(c *gin.Context) {
	userID := c.GetUint64("userID")
	groupIDStr := c.Param("groupId")
	groupID, err := strconv.ParseUint(groupIDStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的分组ID")
		return
	}

	var group models.Group
	if err := config.DB.First(&group, groupID).Error; err != nil {
		utils.NotFound(c, "分组不存在")
		return
	}

	var event models.Event
	if err := config.DB.First(&event, group.EventID).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	if event.CreatorID != userID {
		utils.Forbidden(c, "无权限操作")
		return
	}

	var req struct {
		UserID uint64 `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	var existingMember models.GroupMember
	if err := config.DB.Where("group_id = ? AND user_id = ?", groupID, req.UserID).First(&existingMember).Error; err == nil {
		utils.BadRequest(c, "用户已在此分组")
		return
	}

	config.DB.Where("event_id = ? AND user_id = ?", group.EventID, req.UserID).Delete(&models.GroupMember{})

	member := models.GroupMember{
		GroupID: groupID,
		UserID:  req.UserID,
		EventID: group.EventID,
	}

	if err := config.DB.Create(&member).Error; err != nil {
		utils.InternalServerError(c, "添加失败")
		return
	}

	utils.Success(c, member)
}

func RemoveGroupMember(c *gin.Context) {
	userID := c.GetUint64("userID")
	groupIDStr := c.Param("groupId")
	groupID, err := strconv.ParseUint(groupIDStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的分组ID")
		return
	}

	userIDStr := c.Param("userId")
	targetUserID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		utils.BadRequest(c, "无效的用户ID")
		return
	}

	var group models.Group
	if err := config.DB.First(&group, groupID).Error; err != nil {
		utils.NotFound(c, "分组不存在")
		return
	}

	var event models.Event
	if err := config.DB.First(&event, group.EventID).Error; err != nil {
		utils.NotFound(c, "活动不存在")
		return
	}

	if event.CreatorID != userID {
		utils.Forbidden(c, "无权限操作")
		return
	}

	if err := config.DB.Where("group_id = ? AND user_id = ?", groupID, targetUserID).Delete(&models.GroupMember{}).Error; err != nil {
		utils.InternalServerError(c, "移除失败")
		return
	}

	utils.Success(c, nil)
}
