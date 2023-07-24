class VariantsController < ApplicationController
  before_action :set_variant, only: %i[show]

  # GET /variants/1.json
  def show
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_variant
    @variant = Variant.find(params[:id])
  end
end
