# frozen_string_literal: true

# Category Class
class Category
  include ActiveGraph::Node

  property :uid, type: Integer
  property :name, type: String

  validates :name, presence: true

  has_many :out, :products, type: :HAS_PRODUCTS
end
