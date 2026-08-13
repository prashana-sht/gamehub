class CreateGameScores < ActiveRecord::Migration[8.1]
  def change
    create_table :game_scores do |t|
      t.references :player, null: false, foreign_key: true
      t.string :game_type
      t.integer :score
      t.float :accuracy
      t.integer :max_combo
      t.integer :duration_seconds

      t.timestamps
    end
  end
end
