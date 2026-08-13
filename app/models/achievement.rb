class Achievement < ApplicationRecord
  belongs_to :player

  validates :badge_key, presence: true, uniqueness: { scope: :player_id }
  validates :title, presence: true

  BADGES = {
    "first_blood" => { title: "First Blood", icon: "🥉", description: "Completed your first game in the Arcade!" },
    "speed_demon" => { title: "Speed Demon", icon: "⚡", description: "Scored over 500 points in Cyber Dash!" },
    "memory_master" => { title: "Memory Master", icon: "🧠", description: "Reached level 7+ in Neon Matrix!" },
    "dungeon_slayer" => { title: "Dungeon Slayer", icon: "⚔️", description: "Defeated the Dungeon Boss in Pixel Dice!" },
    "combo_god" => { title: "Combo God", icon: "🔥", description: "Achieved a 15+ combo streak in any game!" },
    "arcade_titan" => { title: "Arcade Titan", icon: "🏆", description: "Accumulated over 3,000 total score points!" }
  }.freeze
end
