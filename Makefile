.phony:
provision:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -vvvv \
	-i .vagrant/provisioners/ansible/inventory/vagrant_ansible_inventory \
	--private-key=.vagrant/machines/default/virtualbox/private_key \
	--start-at-task="$(AT)" \
	-u vagrant playbook.yml
