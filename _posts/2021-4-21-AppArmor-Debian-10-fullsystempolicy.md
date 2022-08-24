---
layout: post
title: AppArmor Full System Policy on Debian 10
excerpt_separator: <!--more-->
---
Guide for using AppArmor with system wide Full System Policy for additional security on Debian 10 Buster.
<!--more-->
<style type="text/css">
  // Adding 'Contents' headline to the TOC
	#markdown-toc::before {
	    content: "Contents";
	    font-weight: bold;
	}


	// Using numbers instead of bullets for listing
	#markdown-toc ul {
	    list-style: decimal;
	}

	#markdown-toc {
	    border: 1px solid #aaa;
	    padding-left: 2em;
	    padding-right: 2em;
	    padding-top: 1em;
	    padding-bottom: 1em;
	    list-style: decimal;
	    display: inline-block;
	}
</style>
* Do not remove this line (it will not be displayed)
{:toc}
# Introduction

While AppArmor is designed to deploy a policy for a specific application, which you consider security sensitive, and want to prevent system attacks through it's vulnerabilities, there are some cases (especially when you are working in a highly secure eg. millitary environment) when you expect different behavior: that all application is under some predeclared default deny policy, and *only* whitelisted applications can do anything on your machine, like with SELinux.

Gladly Apparmor has a solution for that and its called Full System Policy. Details on how it works can be found in the [official guide](https://gitlab.com/apparmor/apparmor/-/wikis/FullSystemPolicy), but what it basically does is define a policy at startup for your system init script (with PID 1), and after that *all* non-kernel processes will be loaded to this profile as a child process.

# The Bad
Currently the [official guide](https://gitlab.com/apparmor/apparmor/-/wikis/FullSystemPolicy) does not work with Debian 10, it works however with Debian 9 (since AppArmor is not default enabled in this release, you should do this manually). If you've followed the steps on Debian 10, you may notice, that while the systemd-init profile is loaded, there are not a single process under this profile. Sad.

# The Good
Fortunatly if you *have to* use Debian 10 no worries, I fixed the guide for you. The reason for the problem is related to the merged /usr folder, which is a concept adopted by Debian 10 out of the box. You can read more about it [here](https://www.freedesktop.org/wiki/Software/systemd/TheCaseForTheUsrMerge/). Because of this it is possible that it affects other distributions as well. For now it means for us, that we need a little modification for the [official guide](https://gitlab.com/apparmor/apparmor/-/wikis/FullSystemPolicy) related to affected paths. 

## Guide for AppArmor FullSystemPolicy on Debian 10
1. Copy the __/usr/sbin/apparmor_parser__ into the initramfs by creating __/etc/initramfs-tools/hooks/apparmor__ with the following content:
{% highlight bash %}
#!/bin/sh
set -e
PREREQ=""
prereqs()
{
    echo "$PREREQ"
}
case $1 in
    prereqs)
        prereqs
        exit 0
        ;;
esac
. /usr/share/initramfs-tools/hook-functions
copy_exec /usr/sbin/apparmor_parser /usr/sbin
{% endhighlight %}

{:start="2"}
2. Make it executable:
{% highlight bash %}
chmod 755 /etc/initramfs-tools/hooks/apparmor
{% endhighlight %}

{:start="3"}
3. Add a script to load policy into the kernel to __/etc/initramfs-tools/scripts/init-bottom/apparmor__ (it could be somewhere else besides init-bottom, this just happens right before the real init is started):
{% highlight bash %}
    #!/bin/sh
#!/bin/sh
PREREQ=""
prereqs()
{
        echo "$PREREQ"
}
case $1 in
prereqs)
        prereqs
        exit 0
        ;;
esac
 
mount -t securityfs none /sys/kernel/security
echo "profile init-systemd /usr/lib/systemd/systemd flags=(complain) {}" | /usr/sbin/apparmor_parser -a
echo "profile init-upstart /usr/sbin/upstart flags=(complain) {}" | /usr/sbin/apparmor_parser -a
{% endhighlight %}

{:start="4"}
4. Make it executable:
{% highlight bash %}
chmod 755 /etc/initramfs-tools/scripts/init-bottom/apparmor
{% endhighlight %}

{:start="5"}
5. Update initramfs for the running kernel:
{% highlight bash %}
update-initramfs -u
{% endhighlight %}

{:start="6"}
6. Reboot

After reboot you can check if everything is working correctly with:
{% highlight bash %}
ps auxZ|grep -v unconfined
{% endhighlight %}

You should see that all runnning non-kernel processes are under this profile. Yay.


