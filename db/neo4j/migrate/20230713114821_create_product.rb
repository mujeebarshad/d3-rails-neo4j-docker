class CreateProduct < ActiveGraph::Migrations::Base
  disable_transactions!

  def up
    # add_constraint :Product, :uuid
  end

  def down
    drop_constraint :Product, :uuid
  end
end
