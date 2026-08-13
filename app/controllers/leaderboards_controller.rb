class LeaderboardsController < ApplicationController
  def index
    @game_type = params[:game_type]
    
    @scores = if @game_type.present? && GameScore::GAME_TYPES.key?(@game_type)
                GameScore.top_for_game(@game_type, 25)
              else
                GameScore.recent_top(25)
              end

    @top_players = Rails.cache.fetch("top_ranked_players_20", expires_in: 5.minutes) do
      Player.order(total_score: :desc).limit(20).to_a
    end
  end
end
