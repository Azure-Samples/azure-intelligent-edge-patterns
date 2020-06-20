# Installing Samba Server

It is one of many ways to create a network-accessible storage, we will create a Samba server.

It is better for security and performance to create the storage server within
the same Azure Stack cluster where you deployed your Kubernetes/Kubeflow cluster.
Using your Azure Stack portal, create a virtual machine. On that machine:


    $ sudo apt update
    $ sudo apt -y install samba
    $ sudo mkdir /home/share
    $ sudo chmod 777 /home/share
    $ sudo vi /etc/samba/smb.conf

Add to the file the entries you would like to use, for example:

    ...
    [sambashare]
        comment = Samba on Ubuntu
        path = /home/azureuser/sambashare
        read only = no
        browsable = yes

    [sambauser1]
        path = /home/share/sambauser1
        read only = no
        browseable = no
        force create mode = 0660
        force directory mode = 2770
        valid users = @sambauser1 @sambashare

    [smbadmin]
        path = /home/share/smbadmin
        read only = no
        browseable = yes
        force create mode = 0660
        force directory mode = 2770
        valid users = @sambashare @smbadmin

Create the users and update the folder ownership:

    $ sudo chgrp sambashare /home/share
    $ sudo useradd -M -d /home/share/sambauser1 -s /usr/sbin/nologin -G sambashare sambauser1
    $ sudo mkdir /home/share/sambauser1
    $ sudo chown sambauser1:sambashare /home/share/sambauser1
    $ sudo chmod 2770 /home/share/sambauser1

And created Samba users:

    $ sudo smbpasswd -a sambauser1
    New SMB password:
    Retype new SMB password:
    Added user sambauser1.

And enable this user:

    $ sudo smbpasswd -e sambauser1
    Enabled user sambauser1.

Create an admin user:

    $ sudo useradd -M -d /home/share/smbadmin -s /usr/sbin/nologin -G sambashare smbadmin
    $ sudo mkdir /home/share/smbadmin
    $ sudo smbpasswd -a smbadmin
    New SMB password:
    Retype new SMB password:
    Added user smbadmin.
    $ sudo smbpasswd -e smbadmin
    Enabled user smbadmin.
    $ sudo chown smbadmin:sambashare /home/share/smbadmin
    $ sudo chmod 2770 /home/share/smbadmin

    $ sudo systemctl restart smbd nmbd

To check the status:

    $ systemctl status smbd
    ● smbd.service - Samba SMB Daemon
       Loaded: loaded (/lib/systemd/system/smbd.service; enabled; vendor preset: enabled)
       Active: active (running) since Fri 2020-05-08 01:11:37 UTC; 19s ago
         Docs: man:smbd(8)
               man:samba(7)
               man:smb.conf(5)
     Main PID: 19151 (smbd)
       Status: "smbd: ready to serve connections..."
        Tasks: 4 (limit: 8303)
       CGroup: /system.slice/smbd.service
               ├─19151 /usr/sbin/smbd --foreground --no-process-group
               ├─19165 /usr/sbin/smbd --foreground --no-process-group
               ├─19166 /usr/sbin/smbd --foreground --no-process-group
               └─19168 /usr/sbin/smbd --foreground --no-process-group

    May 08 01:11:37 sambadata systemd[1]: Starting Samba SMB Daemon...
    May 08 01:11:37 sambadata systemd[1]: Started Samba SMB Daemon.

Update your firewall rules to let the smb traffic through:

    $ sudo ufw allow 'Samba'
    Rules updated
    Rules updated (v6)
                              
And verify that the ports are listening:

    $ sudo netstat -tulpn | egrep "samba|smbd|nmbd|winbind"
    tcp        0      0 0.0.0.0:139             0.0.0.0:*               LISTEN      19151/smbd
    tcp        0      0 0.0.0.0:445             0.0.0.0:*               LISTEN      19151/smbd
    tcp6       0      0 :::139                  :::*                    LISTEN      19151/smbd
    tcp6       0      0 :::445                  :::*                    LISTEN      19151/smbd
    udp        0      0 172.16.0.255:137        0.0.0.0:*                           19126/nmbd
    udp        0      0 172.16.0.4:137          0.0.0.0:*                           19126/nmbd
    udp        0      0 0.0.0.0:137             0.0.0.0:*                           19126/nmbd
    udp        0      0 172.16.0.255:138        0.0.0.0:*                           19126/nmbd
    udp        0      0 172.16.0.4:138          0.0.0.0:*                           19126/nmbd
    udp        0      0 0.0.0.0:138             0.0.0.0:*                           19126/nmbd

You are ready to get the samba clients connect to your server.

Follow the instructions for creating Samba Persistent Volume Claim in [Installing Storage](installing_storage.md)

[Back](Readme.md)