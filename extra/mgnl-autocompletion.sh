# Basic Bash autocompletion for mgnl command
_mgnl_complete ()   #  By convention, the function name starts with an underscore.
{
  local cur command ALL_COMMANDS
  # Pointer to current completion word.
  cur="${COMP_WORDS[COMP_CWORD]}"
  command="${COMP_WORDS[COMP_CWORD-1]}"

  ALL_COMMANDS=(jumpstart create-page create-component create-light-module add-availability setup build start help)
  COMPREPLY=()

  # if more than two words were provided at the prompt, that at position 1
  # (starting from 0) should be the command
  if [[ ${#COMP_WORDS[@]} -gt 2 ]]
  then
      command="${COMP_WORDS[1]}"
  fi

  if [[ ${cur} == -* ]]
  then
    case "$command" in
      create-component)
      COMPREPLY=( $( compgen -W '--path --available --autogenerate --help' -- $cur ) );;
      create-page)
      COMPREPLY=( $( compgen -W '--path --help' -- $cur ) );;
      create-light-module)
      COMPREPLY=( $( compgen -W '--path --help' -- $cur ) );;
      add-availability)
      COMPREPLY=( $( compgen -W '--path --autogenerate --help' -- $cur ) );;
      setup)
      COMPREPLY=( $( compgen -W '--path --help' -- $cur ) );;
      jumpstart)
      COMPREPLY=( $( compgen -W '--path --enterprise-edition --magnolia-version --install-sample-module --help' -- $cur ) );;
      build)
      COMPREPLY=( $( compgen -W '--path --node-modules --help' -- $cur ) );;
      start)
      COMPREPLY=( $( compgen -W '--path --dont-ignore-open-files-check --help' -- $cur ) );;
      *)
      COMPREPLY=();; #restore default bash completion
    esac
  fi

  case "$command" in
    help)
    COMPREPLY=( $( compgen -W '${ALL_COMMANDS[@]:0:8}' -- $cur ) );;
    mgnl)
    COMPREPLY=( $( compgen -W '${ALL_COMMANDS[*]}' -- $cur ) );;
  esac

  case "$cur" in
    cr*)
    COMPREPLY=( $( compgen -W 'create-light-module create-page create-component' -- $cur ) );;
    c*)
    COMPREPLY=( $( compgen -W 'create-' -- $cur ) );;
    j*)
    COMPREPLY=( $( compgen -W 'jumpstart' -- $cur ) );;
    a*)
    COMPREPLY=( $( compgen -W 'add-availability' -- $cur ) );;
    se*)
    COMPREPLY=( $( compgen -W 'setup' -- $cur ) );;
    st*)
    COMPREPLY=( $( compgen -W 'start' -- $cur ) );;
    s*)
    COMPREPLY=( $( compgen -W 'setup start' -- $cur ) );;
    b*)
    COMPREPLY=( $( compgen -W 'build' -- $cur ) );;
  esac
  return 0
}

#register bash autompletion for mgnl. Also restore bash defaults when there's no match. You need to 'source mgnl-autocompletion.sh' to have this working.
complete -o default -F _mgnl_complete mgnl
