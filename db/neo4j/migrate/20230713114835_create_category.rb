class CreateCategory < ActiveGraph::Migrations::Base
  disable_transactions!

  def up
    # add_constraint :Category, :uuid
  end

  def down
    drop_constraint :Category, :uuid
  end
end
