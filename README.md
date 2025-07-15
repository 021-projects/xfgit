# xfgit 

## What is xfgit?
xfgit allows for more efficient management of XenForo add-on repositories by creating symlinks and helping to detach them during the build process.

## Installation

### Download the latest release
You can download the latest release from the [release page](https://github.com/021-projects/xfgit/releases)

### Build from source
If you prefer to build xfgit from source, you will need to have the following dependencies installed:
- Bun 1.2.17 or later

You can build xfgit from source by cloning the repository and running the build script:
```bash
git clone https://github.com/021-projects/xfgit.git
cd xfgit
bun install
bun run build
```

Now your `xfgit` binary should be available in the `bin` directory.

If you are using a Unix-like operating system and want to make `xfgit` available globally, you can use the following command:
```bash
bun run install:unix
```

This command will build the binary for your platform and place it in `/usr/local/bin/xfgit`.

## Usage

### Init
Initializing a new add-on project with predefined directory structure
```bash
xfgit init <addon-id> --js
```

### Alias 
Creating an alias for a XenForo directory in which you will be creating symlinks
```bash
xfgit alias <alias-name> <path>
```

### Link
Creating an add-on symlinks in the specified XenForo directory
```bash
cd <path-to-addon-repository>
xfgit link <alias-name-or-path>
```

### Build
Building the add-on: detaching symlinks and creating a zip archive
```bash
cd <path-to-xenforo-directory>
xfgit build <addon-id>
```

### Config
#### Get current configuration
```bash
xfgit config
```

#### Get configuration path
```bash
xfgit config -p
```
