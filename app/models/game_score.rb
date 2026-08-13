class GameScore < ApplicationRecord
  belongs_to :player

  validates :game_type, presence: true
  validates :score, numericality: { greater_than_or_equal_to: 0 }

  GAME_TYPES = {
    "cyber_dash" => "Cyber Dash (Speed Typing)",
    "neon_memory" => "Neon Matrix (Memory Recall)",
    "pixel_dice" => "Pixel Dungeon (Card & Dice)"
  }.freeze

  after_create_commit :enqueue_processing_job
  after_create_commit :broadcast_leaderboard_update

  private

  def enqueue_processing_job
    ProcessGameScoreJob.perform_later(id)
  end

  def broadcast_leaderboard_update
    broadcast_replace_to(
      "leaderboard_stream",
      target: "leaderboard_widget",
      partial: "leaderboards/widget",
      locals: { scores: GameScore.recent_top }
    )
  end

  def self.recent_top(limit = 10)
    Rails.cache.fetch("global_top_scores_#{limit}", expires_in: 2.minutes) do
      includes(:player).order(score: :desc).limit(limit).to_a
    end
  end

  def self.top_for_game(game_type, limit = 5)
    Rails.cache.fetch("top_scores_#{game_type}_#{limit}", expires_in: 2.minutes) do
      includes(:player).where(game_type: game_type).order(score: :desc).limit(limit).to_a
    end
  end
end
