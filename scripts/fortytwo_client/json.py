from typing import Any, Callable, Dict, Type

SERIALIZERS = {}


def register_serializer(cls: Type, func: Callable[[Any], Dict[str, Any]]) -> None:
    SERIALIZERS[cls] = func


def default_serializer(obj: Any) -> Any:
    for cls, serializer_func in SERIALIZERS.items():
        if isinstance(obj, cls):
            return serializer_func(obj)

    raise TypeError(f"Type {obj.__class__.__name__} not serializable")
