class CreateAchievements < ActiveRecord::Migration[8.1]
  def change
    create_table :achievements do |t|
      t.references :player, null: false, foreign_key: true
      t.string :badge_key
      t.string :title
      t.string :description
      t.datetime :unlocked_at

      t.timestamps
    end
  end
end
