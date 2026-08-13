require "test_helper"

class GamesControllerTest < ActionDispatch::IntegrationTest
  test "should show cyber_dash game" do
    get game_url("cyber_dash")
    assert_response :success
  end

  test "should submit score" do
    post submit_score_game_url("cyber_dash"), params: {
      score: 500,
      max_combo: 10,
      accuracy: 0.95,
      duration_seconds: 30
    }
    assert_response :success
  end
end
