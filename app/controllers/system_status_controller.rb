class SystemStatusController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:trigger_bot_job]

  def index
    @solid_queue_available = defined?(SolidQueue)
    @solid_cache_available = defined?(SolidCache)
    @solid_cable_available = defined?(SolidCable)

    @pending_jobs_count = begin
      SolidQueue::Job.count
    rescue StandardError
      0
    end

    @failed_jobs_count = begin
      SolidQueue::FailedExecution.count
    rescue StandardError
      0
    end

    @cache_entries_count = begin
      SolidCache::Entry.count
    rescue StandardError
      0
    end

    @cable_messages_count = begin
      SolidCable::Message.count
    rescue StandardError
      0
    end

    @recent_jobs = begin
      SolidQueue::Job.order(created_at: :desc).limit(10)
    rescue StandardError
      []
    end

    @kamal_config_exists = File.exist?(Rails.root.join("config/deploy.yml"))
  end

  def trigger_bot_job
    SimulateAiCompetitorJob.perform_later
    redirect_to system_status_path, notice: "Enqueued AI Competitor Job via Solid Queue!"
  end
end
