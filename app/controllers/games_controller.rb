class GamesController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:submit_score]

  def show
    @game_id = params[:id]
    unless GameScore::GAME_TYPES.key?(@game_id)
      redirect_to root_path, alert: "Game not found"
      return
    end

    @game_name = GameScore::GAME_TYPES[@game_id]
    @top_game_scores = GameScore.top_for_game(@game_id, 5)
  end

  def submit_score
    game_type = params[:id] || params[:game_type]
    score_val = params[:score].to_i
    max_combo = params[:max_combo].to_i
    accuracy = params[:accuracy].to_f
    duration = params[:duration_seconds].to_i
    player_param = params[:player_id]

    player = if player_param.to_i > 0
               Player.find_by(id: player_param)
             end

    player ||= Player.find_or_create_by(username: "ArcadeRookie_#{rand(100..999)}") do |p|
      p.avatar = "👾"
    end

    game_score = player.game_scores.create!(
      game_type: game_type,
      score: score_val,
      max_combo: max_combo,
      accuracy: accuracy,
      duration_seconds: duration
    )

    render json: {
      status: "success",
      score_id: game_score.id,
      player: {
        id: player.id,
        username: player.username,
        level: player.level,
        title: player.title
      }
    }
  end
end
