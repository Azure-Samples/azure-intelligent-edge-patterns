class Registry(object):

    def __init__(self, name, module_type=None):
        self._name = name
        self._module_dict = dict()
        self._module_type = module_type

    @property
    def name(self):
        return self._name

    @property
    def module_dict(self):
        return self._module_dict

    def _register_module(self, module_class):
        """Register a module.

        Args:
            module: Module to be registered.
        """
        if self._module_type is not None and not isinstance(module_class, self._module_type):
            raise TypeError('module must be a child of {}, but got {}'.
                            format(self._module_type, module_class))
        module_name = module_class.__name__
        if module_name in self._module_dict:
            raise KeyError('{} is already registered in {}'.format(
                module_name, self.name))
        self._module_dict[module_name] = module_class

    def register_module(self, cls):
        self._register_module(cls)
        return cls
