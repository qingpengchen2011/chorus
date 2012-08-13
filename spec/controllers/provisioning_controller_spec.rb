require 'spec_helper'

describe ProvisioningController do
  let(:user) { FactoryGirl.create(:user) }
  before(:each) do
    log_in user
  end

  describe "#show" do
    before do
      any_instance_of(Aurora::Service) do |aurora_service|
        stub(aurora_service).provider_status { "install_succeed" }
      end
    end

    it "responds with a success" do
      get :show
      response.code.should == "200"
      decoded_response.install_succeed.should be_true
    end
  end
end