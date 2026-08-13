class SimulateAiCompetitorJob < ApplicationJob
  queue_as :default

  AI_BOTS = [
    { username: "VaporBot_99", avatar: "🤖" },
    { username: "CyberViper", avatar: "⚡" },
    { username: "PixelNinja", avatar: "⚔️" },
    { username: "NeonQueen", avatar: "🔮" },
    { username: "RetroGamer_X", avatar: "🕹️" }
  ].freeze

  def perform(game_type = nil)
    bot_info = AI_BOTS.sample
    bot = Player.find_or_create_by!(username: bot_info[:username]) do |p|
      p.avatar = bot_info[:avatar]
    end

    game_type ||= GameScore::GAME_TYPES.keys.sample
    score_val = rand(250..950)
    combo_val = rand(3..18)
    accuracy_val = (rand(80..100).to_f / 100).round(2)

    bot.game_scores.create!(
      game_type: game_type,
      score: score_val,
      max_combo: combo_val,
      accuracy: accuracy_val,
      duration_seconds: rand(20..60)
    )
  end
end
