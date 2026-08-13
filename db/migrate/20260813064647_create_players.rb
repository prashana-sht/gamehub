class CreatePlayers < ActiveRecord::Migration[8.1]
  def change
    create_table :players do |t|
      t.string :username, null: false
      t.string :avatar, default: "👾"
      t.integer :games_played, default: 0
      t.integer :total_score, default: 0
      t.integer :level, default: 1
      t.string :title, default: "Arcade Cadet"

      t.timestamps
    end
    add_index :players, :username, unique: true
  end
end
