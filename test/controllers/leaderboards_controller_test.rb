require "test_helper"

class LeaderboardsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get leaderboards_url
    assert_response :success
  end
end
