class CreateVariant < ActiveGraph::Migrations::Base
  disable_transactions!

  def up
    add_constraint :Variant, :uuid
  end

  def down
    drop_constraint :Variant, :uuid
  end
end
