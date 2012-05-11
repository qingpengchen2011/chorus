require 'spec_helper'
require 'base64'

class LegacyImage < ActiveRecord::Base
  establish_connection :legacy_test

  def self.table_name
    "edc_image_instance"
  end

  def self.inheritance_column
    nil
  end
end

TYPE_MAP = {
  "image/png" => "PNG",
  "image/jpeg" => "JPEG",
  "image/gif" => "GIF"
}

describe ImageMigrator, :type => :data_migration do
  describe ".migrate" do
    describe "copying the data" do
      before do
        UserMigrator.new.migrate
        WorkspaceMigrator.new.migrate
        ImageMigrator.new.migrate
      end

      it "gives an image attachment to all users who had profile images" do
        legacy_users_with_images = Legacy.connection.select_all("select * from edc_user where image_id is not null")

        legacy_users_with_images.length.should == 3

        legacy_users_with_images.each do |legacy_user|
          new_user = User.find_with_destroyed(legacy_user["chorus_rails_user_id"])

          image_id = legacy_user["image_id"]
          image_instance_row = Legacy.connection.select_one("select * from edc_image_instance where image_id = '#{image_id}' and type = 'original'")
          image_row = Legacy.connection.select_one("select * from edc_image where id = '#{image_id}'")

          type = TYPE_MAP[image_row["type"]]
          width = image_instance_row["width"]
          length = image_instance_row["length"]

          `identify #{new_user.image.path(:original)}`.should include "#{type} #{width}x#{length}"
        end
      end

      it "gives an image attachment to all workspaces which had icons" do
        legacy_workspaces_with_images = Legacy.connection.select_all("select * from edc_workspace where icon_id is not null")

        legacy_workspaces_with_images.length.should == 1

        legacy_workspaces_with_images.each do |legacy_workspace|
          new_workspace = Workspace.find(legacy_workspace["chorus_rails_workspace_id"])

          icon_id = legacy_workspace["icon_id"]
          image_instance_row = Legacy.connection.select_one("select * from edc_image_instance where image_id = '#{icon_id}' and type = 'original'")
          image_row = Legacy.connection.select_one("select * from edc_image where id = '#{icon_id}'")

          type = TYPE_MAP[image_row["type"]]
          width = image_instance_row["width"]
          length = image_instance_row["length"]

          `identify #{new_workspace.image.path(:original)}`.should include "#{type} #{width}x#{length}"
        end
      end
    end
  end
end