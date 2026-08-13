require "test_helper"

class SystemStatusControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get system_status_url
    assert_response :success
  end
end
