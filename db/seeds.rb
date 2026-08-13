puts "Seeding Nexus Arcade data..."

load Rails.root.join("db/queue_schema.rb") unless ActiveRecord::Base.connection.table_exists?("solid_queue_jobs")
load Rails.root.join("db/cache_schema.rb") unless ActiveRecord::Base.connection.table_exists?("solid_cache_entries")
load Rails.root.join("db/cable_schema.rb") unless ActiveRecord::Base.connection.table_exists?("solid_cable_messages")

bots = [
  { username: "VaporBot_99", avatar: "🤖", title: "Cyber Legend", level: 12 },
  { username: "CyberViper", avatar: "⚡", title: "Synthwave Champion", level: 9 },
  { username: "PixelNinja", avatar: "⚔️", title: "Cyber Striker", level: 6 },
  { username: "NeonQueen", avatar: "🔮", title: "Arcade Overlord", level: 25 },
  { username: "RetroGamer_X", avatar: "🕹️", title: "Pixel Runner", level: 4 }
]

created_players = bots.map do |b|
  player = Player.find_or_create_by!(username: b[:username]) do |p|
    p.avatar = b[:avatar]
    p.title = b[:title]
    p.level = b[:level]
  end

  # Create scores for each game type
  GameScore::GAME_TYPES.keys.each do |gtype|
    3.times do
      player.game_scores.create!(
        game_type: gtype,
        score: rand(300..1200),
        max_combo: rand(5..20),
        accuracy: (rand(85..100).to_f / 100).round(2),
        duration_seconds: rand(30..90)
      )
    end
  end

  player.recalculate_stats!
  player
end

# Seed some achievements for top player
if top_player = created_players.first
  Achievement::BADGES.each do |key, info|
    top_player.achievements.find_or_create_by!(badge_key: key) do |a|
      a.title = info[:title]
      a.description = info[:description]
      a.unlocked_at = Time.current - rand(1..10).days
    end
  end
end

puts "Arcade seed complete! Created #{Player.count} players and #{GameScore.count} scores."
