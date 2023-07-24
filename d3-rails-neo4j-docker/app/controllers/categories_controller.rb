class CategoriesController < ApplicationController
  before_action :set_category, only: %i[show]

  # GET /categories/1.json
  def show
    @graph_nodes_links = GraphMappingService.new(@category).call
    respond_to do |format|
      format.json { render json: @graph_nodes_links }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_category
    @category = Category.find(params[:id])
  end
end
