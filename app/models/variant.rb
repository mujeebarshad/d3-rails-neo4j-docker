# frozen_string_literal: true

# Variant Class
class Variant
  include ActiveGraph::Node

  property :uid, type: Integer
  property :name, type: String

  validates :name, presence: true

  has_one :in, :product, origin: :variants
end
