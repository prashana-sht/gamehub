# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_13_064700) do
  create_table "achievements", force: :cascade do |t|
    t.string "badge_key"
    t.datetime "created_at", null: false
    t.string "description"
    t.integer "player_id", null: false
    t.string "title"
    t.datetime "unlocked_at"
    t.datetime "updated_at", null: false
    t.index ["player_id"], name: "index_achievements_on_player_id"
  end

  create_table "game_scores", force: :cascade do |t|
    t.float "accuracy"
    t.datetime "created_at", null: false
    t.integer "duration_seconds"
    t.string "game_type"
    t.integer "max_combo"
    t.integer "player_id", null: false
    t.integer "score"
    t.datetime "updated_at", null: false
    t.index ["player_id"], name: "index_game_scores_on_player_id"
  end

  create_table "players", force: :cascade do |t|
    t.string "avatar", default: "👾"
    t.datetime "created_at", null: false
    t.integer "games_played", default: 0
    t.integer "level", default: 1
    t.string "title", default: "Arcade Cadet"
    t.integer "total_score", default: 0
    t.datetime "updated_at", null: false
    t.string "username", null: false
    t.index ["username"], name: "index_players_on_username", unique: true
  end

  add_foreign_key "achievements", "players"
  add_foreign_key "game_scores", "players"
end
