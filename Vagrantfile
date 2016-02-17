# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.synced_folder "./logs/", "/usr/local/reactorfilm/logs/"
  config.vm.network "forwarded_port", guest: 27017, host: 8017
  config.vm.network "forwarded_port", guest: 443, host: 8002
  #config.vm.network :public_network, bridge: 'eth0'
  config.vm.provider :virtualbox do |vb|
    vb.customize [
      "modifyvm", :id,
      "--memory", "1024"
    ]
  end

  config.vm.provision 'ansible' do |ansible|
    ansible.playbook = 'playbook.yml'
    ansible.verbose = 'vvvv'
  end
end
