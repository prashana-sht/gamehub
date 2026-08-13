class ArcadeController < ApplicationController
  def index
    @top_scores = GameScore.recent_top(10)
    
    @stats = Rails.cache.fetch("arcade_global_stats_v1", expires_in: 2.minutes) do
      {
        total_games: GameScore.count,
        total_players: Player.count,
        total_score_all_time: GameScore.sum(:score),
        top_game: GameScore.group(:game_type).order('count_all desc').count.first&.first || "cyber_dash"
      }
    end

    @recent_achievements = Achievement.includes(:player).order(unlocked_at: :desc).limit(5)
  end

  def stats
    stats_data = Rails.cache.fetch("arcade_global_stats_v1") do
      {
        total_games: GameScore.count,
        total_players: Player.count,
        total_score_all_time: GameScore.sum(:score)
      }
    end

    queue_count = begin
      SolidQueue::Job.count
    rescue StandardError
      0
    end

    render json: {
      stats: stats_data,
      solid_queue_pending_jobs: queue_count,
      cache_backend: Rails.cache.class.name
    }
  end
end
