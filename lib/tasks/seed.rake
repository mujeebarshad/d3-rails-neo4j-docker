# frozen_string_literal: true

require 'faker'
# Define the number of records you want to create for each model
NUM_CATEGORIES = 3
NUM_PRODUCTS = 9
NUM_VARIANTS = 200

desc 'Seed data'
namespace :db do
  task :seed => :environment do
    # Create Categories
    NUM_CATEGORIES.times do
      Category.create(
        uid: Faker::Number.unique.number(digits: 6),
        name: Faker::Commerce.department
      )
    end

    # Create Products
    categories = Category.all.to_a
    NUM_PRODUCTS.times do
      product = Product.new(
        uid: Faker::Number.unique.number(digits: 6),
        title: Faker::Commerce.product_name,
        brand: Faker::Commerce.brand
      )

      # Assign category to product
      category = categories.sample
      product.category = category

      if product.save
        puts "Product '#{product.title}' created with category '#{category.name}'"
      else
        puts "Failed to create Product: #{product.errors.full_messages.join(', ')}"
      end
    end

    # Create Variants
    products = Product.all.to_a
    NUM_VARIANTS.times do
      variant = Variant.new(
        uid: Faker::Number.unique.number(digits: 6),
        name: Faker::Commerce.color
      )

      # Assign product to variant
      product = products.sample
      variant.product = product

      if variant.save
        puts "Variant '#{variant.name}' created for product '#{product.title}'"
      else
        puts "Failed to create Variant: #{variant.errors.full_messages.join(', ')}"
      end
    end
  end
end
