class PlayersController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create]

  def create
    username = params.dig(:player, :username)&.strip
    avatar = params.dig(:player, :avatar) || "👾"

    if username.blank?
      render json: { error: "Username required" }, status: :unprocessable_entity
      return
    end

    player = Player.find_or_create_by!(username: username) do |p|
      p.avatar = avatar
    end
    player.update(avatar: avatar) if avatar.present?

    render json: {
      id: player.id,
      username: player.username,
      avatar: player.avatar,
      level: player.level,
      title: player.title,
      total_score: player.total_score
    }
  end

  def show
    @player = Player.find(params[:id])
    @game_scores = @player.game_scores.order(created_at: :desc).limit(20)
    @achievements = @player.achievements.order(unlocked_at: :desc)
  end
end
