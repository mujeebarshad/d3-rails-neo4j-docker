# frozen_string_literal: true

class GraphMappingService < ApplicationService
  def initialize(active_record_object)
    @active_record_object = active_record_object
    @class = @active_record_object.class
  end

  def call
    nodes = []
    links = []

    nodes << prepare_node(@active_record_object)
    @active_record_object.reflections.each do |association_name, association_info|
      relationship_type = association_info.association.relationship_type
      query_object      = @active_record_object.send(association_name)
      direction         = association_info.association.direction
      nodes_and_links   = prepare_network_hierarchy(query_object, direction, relationship_type)

      nodes << nodes_and_links[:nodes]
      links << nodes_and_links[:links]
    end
    { nodes: nodes.flatten, links: links.flatten }
  end

  protected

  def prepare_network_hierarchy(query_object, direction, relationship_type)
    nodes = []
    links = []
    if query_object.is_a?(Enumerable)
      query_object.each do |association_instance|
        nodes << prepare_node(association_instance)

        link_params = direction == :out ? [@active_record_object, association_instance, relationship_type] : [association_instance, @active_record_object, relationship_type]
        links << prepare_link(*link_params)
      end
    else
      nodes << prepare_node(query_object)

      link_params = direction == :out ? [@active_record_object, query_object, relationship_type] : [query_object, @active_record_object, relationship_type]
      links << prepare_link(*link_params)
    end

    { nodes: nodes.flatten, links: links.flatten }
  end

  def prepare_node(object)
    {
      id: "#{object.send(find_primary_attribute).to_s.parameterize(separator: '_')}_#{object.class.name}",
      name: object.send(find_label_attribute(object)), icon: get_icon(object),
      show: true,
      showChildren: identical_class?(object),
      cache: identical_class?(object), hasChildren: children?(object)
    }
  end

  def prepare_link(source, target, relationship_type)
    {
      source: "#{source.send(find_primary_attribute).to_s.parameterize(separator: '_')}_#{source.class.name}",
      target: "#{target.send(find_primary_attribute).to_s.parameterize(separator: '_')}_#{target.class.name}",
      show: true,
      relationship_name: relationship_type
    }
  end

  def identical_class?(object)
    object.class.name == @class.name
  end

  def find_label_attribute(object)
    object.class.name == Product.name ? :title : :name
  end

  def find_primary_attribute
    :id
  end

  def children?(object)
    object.reflections.each do |association_name, association_info|
      next if association_info.association.direction == :in

      return true if object.send(association_name).any?
    end
    false
  end

  def get_icon(object)
    case object.class.name
    when Product.name
      :f187
    when Category.name
      :f5fd
    when Variant.name
      :f5cb
    end
  end
end
