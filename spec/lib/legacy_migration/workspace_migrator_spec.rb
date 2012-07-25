require 'spec_helper'

describe WorkspaceMigrator, :legacy_migration => true, :type => :legacy_migration do
  describe ".migrate" do
    describe "the new foreign key column" do
      before(:each) do
        Legacy.connection.column_exists?(:edc_workspace, :chorus_rails_workspace_id).should be_false
      end

      it "adds the new foreign key column" do
        UserMigrator.new.migrate
        WorkspaceMigrator.new.migrate
        Legacy.connection.column_exists?(:edc_workspace, :chorus_rails_workspace_id).should be_true
      end
    end

    describe "copying the data" do
      it "creates new workspaces for legacy workspaces" do
        expect {
          UserMigrator.new.migrate
          WorkspaceMigrator.new.migrate
        }.to change(Workspace.unscoped, :count).by(73)
      end

      it "creates new workspaces for legacy workspaces 2" do
        expect {
          UserMigrator.new.migrate
          WorkspaceMigrator.new.migrate
        }.to change(Workspace, :count).by(68)
      end

      it "copies the correct data fields from the legacy workspace" do
        UserMigrator.new.migrate
        WorkspaceMigrator.new.migrate

        Legacy.connection.select_all("SELECT * FROM edc_workspace where is_deleted is false").each do |legacy_workspace|
          workspace = Workspace.find(legacy_workspace["chorus_rails_workspace_id"])
          workspace.name.should == legacy_workspace["name"]
          workspace.public.should == WorkspaceMigrator.str_to_bool(legacy_workspace["is_public"])
          workspace.archived_at.should == legacy_workspace["archived_timestamp"]
          workspace.archiver.should == User.unscoped.find_by_username(legacy_workspace["archiver"])

          workspace.summary.should == legacy_workspace["summary"]

          workspace.owner.should == User.find_by_username(legacy_workspace["owner"])
        end
      end

      it "copies deleted workspaces, and assigns their 'deleted_at' field" do
        UserMigrator.new.migrate
        WorkspaceMigrator.new.migrate

        Legacy.connection.select_all("SELECT * FROM edc_workspace where is_deleted is true").each do |legacy_workspace|
          workspace = Workspace.find_with_destroyed(legacy_workspace["chorus_rails_workspace_id"])
          workspace.deleted_at.should == legacy_workspace["last_updated_tx_stamp"]
        end
      end
    end
  end
end