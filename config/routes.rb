Rails.application.routes.draw do
  resources :products, only: %i[index show]
  resources :categories, only: %i[show]
  resources :variants, only: %i[show]
  # Defines the root path route ("/")
  root 'products#index'
end
