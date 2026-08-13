Rails.application.routes.draw do
  root "arcade#index"

  resources :games, only: [:show], param: :id do
    post :submit_score, on: :member
  end

  resources :players, only: [:create, :show]
  resources :leaderboards, only: [:index]

  get "system_status", to: "system_status#index"
  post "system_status/trigger_bot_job", to: "system_status#trigger_bot_job"

  get "up" => "rails/health#show", as: :rails_health_check
end
