# frozen_string_literal: true

# Product Class
class Product
  include ActiveGraph::Node

  property :uid, type: Integer
  property :title, type: String
  property :brand, type: String

  validates :title, presence: true

  has_one :in, :category, origin: :products
  has_many :out, :variants, type: :HAS_VARIANTS
end
