require "test_helper"

class PlayersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @player = players(:one)
  end

  test "should show player" do
    get player_url(@player)
    assert_response :success
  end

  test "should create player" do
    assert_difference("Player.count") do
      post players_url, params: { player: { username: "NewUniqueGamer", avatar: "🤖" } }
    end
    assert_response :success
  end
end
