class ProductsController < ApplicationController
  before_action :set_product, only: %i[show]

  # GET /products or /products.json
  def index
    @products = Product.all
  end

  # GET /products/1 or /products/1.json
  def show
    @graph_nodes_links = GraphMappingService.new(@product).call
    respond_to do |format|
      format.html
      format.json { render json: @graph_nodes_links }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_product
    @product = Product.find(params[:id])
  end
end
