class ProcessGameScoreJob < ApplicationJob
  queue_as :default

  def perform(game_score_id)
    score = GameScore.find_by(id: game_score_id)
    return unless score

    player = score.player
    previous_level = player.level
    player.recalculate_stats!

    # Clear Solid Cache entries for leaderboards
    Rails.cache.delete("global_top_scores_10")
    Rails.cache.delete("top_scores_#{score.game_type}_5")

    # Evaluate achievements
    check_achievements(player, score)

    # Broadcast level up or achievement notice via Turbo Stream
    if player.level > previous_level
      Turbo::StreamsChannel.broadcast_prepend_to(
        "arcade_feed",
        target: "live_notifications",
        partial: "shared/level_up_notification",
        locals: { player: player }
      )
    end
  end

  private

  def check_achievements(player, score)
    unlock_badge(player, "first_blood") if player.games_played >= 1

    if score.game_type == "cyber_dash" && score.score >= 500
      unlock_badge(player, "speed_demon")
    end

    if score.game_type == "neon_memory" && score.max_combo.to_i >= 7
      unlock_badge(player, "memory_master")
    end

    if score.game_type == "pixel_dice" && score.score >= 400
      unlock_badge(player, "dungeon_slayer")
    end

    if score.max_combo.to_i >= 15
      unlock_badge(player, "combo_god")
    end

    if player.total_score >= 3000
      unlock_badge(player, "arcade_titan")
    end
  end

  def unlock_badge(player, badge_key)
    badge = Achievement::BADGES[badge_key]
    return unless badge

    achievement = player.achievements.find_or_create_by(badge_key: badge_key) do |a|
      a.title = badge[:title]
      a.description = badge[:description]
      a.unlocked_at = Time.current
    end

    if achievement.previously_new_record?
      Turbo::StreamsChannel.broadcast_prepend_to(
        "arcade_feed",
        target: "live_notifications",
        partial: "shared/badge_notification",
        locals: { player: player, achievement: achievement, badge: badge }
      )
    end
  end
end
