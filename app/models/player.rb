class Player < ApplicationRecord
  has_many :game_scores, dependent: :destroy
  has_many :achievements, dependent: :destroy

  validates :username, presence: true, uniqueness: { case_sensitive: false }

  AVATARS = %w[👾 ⚡ 🕹️ 🚀 🤖 ⚔️ 🔮 🏎️ 🎯 💎 🐲 🪐]

  def recalculate_stats!
    self.games_played = game_scores.count
    self.total_score = game_scores.sum(:score)
    self.level = [ (total_score / 500).floor + 1, 99 ].min
    self.title = calculate_title
    save!
  end

  def high_score_for(game_type)
    game_scores.where(game_type: game_type).maximum(:score) || 0
  end

  private

  def calculate_title
    case level
    when 1..2 then "Arcade Cadet"
    when 3..5 then "Pixel Runner"
    when 6..10 then "Cyber Striker"
    when 11..20 then "Synthwave Champion"
    when 21..50 then "Neon Legend"
    else "Arcade Overlord"
    end
  end
end
